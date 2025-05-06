// server/src/tests/repositories/repositoryConsistency.test.js
const UserRepository = require('../../../src/data/repositories/userRepository');
const ProductRepository = require('../../../src/data/repositories/productRepository');
const CategoryRepository = require('../../../src/data/repositories/categoryRepository');
const OrderRepository = require('../../../src/data/repositories/orderRepository');
const CartRepository = require('../../../src/data/repositories/cartRepository');
const ReviewRepository = require('../../../src/data/repositories/reviewRepository');

describe('Repository Consistency', () => {
  const repositories = [
    { name: 'UserRepository', repo: new UserRepository() },
    { name: 'ProductRepository', repo: new ProductRepository() },
    { name: 'CategoryRepository', repo: new CategoryRepository() },
    { name: 'OrderRepository', repo: new OrderRepository() },
    { name: 'CartRepository', repo: new CartRepository() },
    { name: 'ReviewRepository', repo: new ReviewRepository() },
  ];

  test('All repositories should have the same base methods', () => {
    const requiredMethods = ['findAll', 'findById', 'create', 'update', 'delete'];

    repositories.forEach(({ name, repo }) => {
      requiredMethods.forEach((method) => {
        expect(typeof repo[method]).toBe('function', `${name} should have method ${method}`);
      });
    });
  });

  test('Repositories should have consistent parameter patterns', () => {
    repositories.forEach(({ name, repo }) => {
      // Check if constructor exists
      expect(repo.constructor).toBeDefined(`${name} should have a constructor`);

      // Check method parameter count
      const findByIdParameterCount = repo.findById.length;
      expect(findByIdParameterCount).toBe(1, `${name}.findById should accept 1 parameter (id)`);

      const updateParameterCount = repo.update.length;
      expect(updateParameterCount).toBe(2, `${name}.update should accept 2 parameters (id, data)`);
    });
  });
});
