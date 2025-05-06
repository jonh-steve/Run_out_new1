#!/bin/sh

# Script thực hiện sao lưu MongoDB
# Tác giả: Steve
# Dự án: RunOut-Biliard

# Biến môi trường
MONGO_HOST=${MONGO_HOST:-mongodb}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_USERNAME=${MONGO_USERNAME:-root}
MONGO_PASSWORD=${MONGO_PASSWORD:-example}
MONGO_DATABASE=${MONGO_DATABASE:-runout_biliard}
BACKUP_DIR=${BACKUP_DIR:-/backup}
BACKUP_CRON=${BACKUP_CRON:-"0 2 * * *"} # Mặc định: 2 giờ sáng hàng ngày
BACKUP_RETENTION=${BACKUP_RETENTION:-7} # Giữ lại backup trong 7 ngày

# Đảm bảo thư mục backup tồn tại
mkdir -p ${BACKUP_DIR}

# Hàm thực hiện backup
perform_backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILENAME="${MONGO_DATABASE}_${TIMESTAMP}.gz"
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
    
    echo "$(date): Bắt đầu sao lưu ${MONGO_DATABASE} vào ${BACKUP_PATH}..."
    
    # Thực hiện backup với mongodump
    mongodump \
        --host=${MONGO_HOST} \
        --port=${MONGO_PORT} \
        --username=${MONGO_USERNAME} \
        --password=${MONGO_PASSWORD} \
        --authenticationDatabase=admin \
        --db=${MONGO_DATABASE} \
        --gzip \
        --archive=${BACKUP_PATH}
    
    # Kiểm tra kết quả
    if [ $? -eq 0 ]; then
        echo "$(date): Sao lưu thành công: ${BACKUP_PATH}"
        
        # Cập nhật chủ sở hữu file
        chmod 600 ${BACKUP_PATH}
        
        # Lưu thông tin meta
        echo "Database: ${MONGO_DATABASE}" > "${BACKUP_PATH}.meta"
        echo "Created at: $(date)" >> "${BACKUP_PATH}.meta"
        echo "Server: ${MONGO_HOST}:${MONGO_PORT}" >> "${BACKUP_PATH}.meta"
        echo "Signature: RunOut-Biliard - Steve" >> "${BACKUP_PATH}.meta"
    else
        echo "$(date): Sao lưu thất bại: ${BACKUP_PATH}"
    fi
}

# Hàm xóa backup cũ
cleanup_old_backups() {
    echo "$(date): Xóa các bản sao lưu cũ hơn ${BACKUP_RETENTION} ngày..."
    find ${BACKUP_DIR} -name "${MONGO_DATABASE}_*.gz" -type f -mtime +${BACKUP_RETENTION} -delete
    find ${BACKUP_DIR} -name "${MONGO_DATABASE}_*.gz.meta" -type f -mtime +${BACKUP_RETENTION} -delete
    echo "$(date): Đã xóa các bản sao lưu cũ."
}

# Thực hiện backup ngay lập tức
perform_backup
cleanup_old_backups

# Nếu được chạy như một container độc lập, thiết lập cron job
if [ "$1" = "schedule" ]; then
    echo "Thiết lập cron job: ${BACKUP_CRON}"
    echo "${BACKUP_CRON} /scripts/mongodb-backup.sh backup" > /etc/crontabs/root
    crond -f -d 8
else
    echo "Backup thủ công hoàn tất. Thoát..."
fi