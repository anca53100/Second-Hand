import * as adminService from '../services/admin.service.js';

export async function getStats(req, res) {
  res.json(await adminService.getStats());
}
