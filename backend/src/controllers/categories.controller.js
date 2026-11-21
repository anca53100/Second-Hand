import * as categoriesService from '../services/categories.service.js';

export async function listCategories(req, res) {
  res.json(await categoriesService.listCategories(req.query.status));
}

export async function createCategory(req, res) {
  res.status(201).json(await categoriesService.createCategory(req.body));
}

export async function updateCategory(req, res) {
  res.json(await categoriesService.updateCategory(req.params.id, req.body));
}

export async function setCategoryStatus(req, res) {
  res.json(await categoriesService.setCategoryStatus(req.params.id, req.body));
}
