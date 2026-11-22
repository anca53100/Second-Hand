import * as requestsService from '../services/requests.service.js';

export async function listMyRequests(req, res) {
  res.json(await requestsService.listMyRequests(req.user));
}

export async function getMyRequest(req, res) {
  res.json(await requestsService.getMyRequest(req.params.id, req.user));
}

export async function createRequest(req, res) {
  res.status(201).json(await requestsService.createRequest(req.body ?? {}, req.user));
}

export async function listReceivedRequests(req, res) {
  res.json(await requestsService.listReceivedRequests(req.user));
}

export async function updateRequestStatus(req, res) {
  res.json(await requestsService.updateRequestStatus(req.params.id, req.body, req.user));
}

export async function deleteReceivedRequest(req, res) {
  await requestsService.deleteReceivedRequest(req.params.id, req.user);
  res.status(204).end();
}
