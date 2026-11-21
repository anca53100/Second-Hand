import * as usersService from '../services/users.service.js';

export async function getMe(req, res) {
  res.json(await usersService.getMe(req.user));
}

export async function updateMe(req, res) {
  res.json(await usersService.updateMe(req.user, req.body ?? {}));
}

export async function listUsers(req, res) {
  res.json(await usersService.listUsers(req.query));
}

export async function setUserStatus(req, res) {
  res.json(await usersService.setUserStatus(req.params.id, req.body, req.user));
}

export async function setUserRole(req, res) {
  res.json(await usersService.setUserRole(req.params.id, req.body, req.user));
}
