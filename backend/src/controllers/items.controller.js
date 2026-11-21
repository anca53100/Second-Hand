import * as itemsService from '../services/items.service.js';

export async function listItems(req, res) {
  const { total, items } = await itemsService.listItems(req.query, req.user);
  res.set('X-Total-Count', String(total));
  res.json(items);
}

export async function listMyItems(req, res) {
  res.json(await itemsService.listMyItems(req.user));
}

export async function getItem(req, res) {
  res.json(await itemsService.getItem(req.params.id, req.user));
}

export async function createItem(req, res) {
  res.status(201).json(await itemsService.createItem(req.body, req.user));
}

export async function updateItem(req, res) {
  res.json(await itemsService.updateItem(req.params.id, req.body, req.user));
}

export async function setItemStatus(req, res) {
  res.json(await itemsService.setItemStatus(req.params.id, req.body, req.user));
}
