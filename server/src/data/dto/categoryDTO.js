// server/src/data/dto/categoryDTO.js
class CategoryDTO {
  constructor(category) {
    this.id = category._id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.parent = category.parent;
    this.ancestors = category.ancestors;
    this.level = category.level;
    this.image = category.image;
    this.icon = category.icon;
    this.order = category.order;
    this.isActive = category.isActive;
    this.isVisible = category.isVisible;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.children = category.children || [];
    this.meta = category.meta || {};
    this.meta.title = category.meta?.title || '';
    this.meta.description = category.meta?.description || '';
    this.meta.keywords = category.meta?.keywords || '';
    this.meta.robots = category.meta?.robots || '';
    this.meta.canonical = category.meta?.canonical || '';
  }

  static fromEntity(category) {
    return new CategoryDTO(category);
  }

  static fromEntities(categories) {
    return categories.map((category) => CategoryDTO.fromEntity(category));
  }

  static toEntity(dto) {
    const entity = { ...dto };
    delete entity.id;
    return entity;
  }

  static fromTree(categoryTree) {
    return categoryTree.map((category) => {
      const dto = CategoryDTO.fromEntity(category);
      if (category.children && category.children.length > 0) {
        dto.children = CategoryDTO.fromTree(category.children);
      }
      return dto;
    });
  }
}

module.exports = CategoryDTO;
