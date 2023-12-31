import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class KartaService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getInventories(data: any) {
    return this._httpService.POST('/karta_catalogs/get-all', data);
  }
  lastSavedKarta(data: any) {
    return this._httpService.POST('/karta_nodes/last-saved-karta', data);
  }
  lastUpdatedKarta(data: any) {
    return this._httpService.POST('/karta_nodes/last-updated-karta', data);
  }
  getPhases(kartaId: string) {
    return this._httpService.GET(`/karta_phases?filter[where][kartaId]=${kartaId}&filter[where][is_deleted]=false`);
  }
  getGlobalPhases() {
    const query = { where: { kartaId: { exists: false } } };
    return this._httpService.GET(`/karta_phases?filter=${JSON.stringify(query)}`);
  }
  addPhase(data: any) {
    return this._httpService.POST('/karta_phases', data);
  }
  updatePhase(phaseId: string, data: any) {
    return this._httpService.PATCH(`/karta_phases/${phaseId}`, data);
  }
  deletePhase(data: { kartaId: string, phaseId: string }) {
    return this._httpService.POST('/karta_phases/delete', data);
  }
  getSuggestion(data: any) {
    return this._httpService.POST('/suggestions/by-user', data);
  }
  getKarta(kartaId: string) {
    return this._httpService.GET(`/karta/${kartaId}?filter[include]=node`);
  }
  getPreviousKarta(data: any) {
    return this._httpService.POST("/karta/view-karta-details", data);
  }
  getKpisData(data: any) {
    return this._httpService.POST("/karta_nodes/get-kpis-data", data);
  }
  getAllKartas(data: any) {
    return this._httpService.POST('/karta/get-all', data);
  }
  getAllMembers(data: any) {
    return this._httpService.POST('/users/get-all-members', data);
  }
  getAllVersions(kartaId: string) {
    return this._httpService.GET(`/karta_versions?filter[where][kartaId]=${kartaId}&filter[order]=createdAt ASC`);    
  }
  getKartaHistory() {
    return this._httpService.GET(`/karta_histories`);
  }

  createKartaVersion(data: any){
    return this._httpService.POST('/karta_versions', data);
  }
  createVersion(data: any){
    return this._httpService.POST('/karta_versions/create-version', data);
  }
  createKarta(data: any) {
    return this._httpService.POST('/karta', data);
  }

  findKartaByUser(userId: any) {
    return this._httpService.GET(`/karta?filter[where][userId]=${userId}`);
  }

  getIntroKarta() {
    return this._httpService.GET('/karta?filter[where][name]=INTRO_KARTA&filter[where][sample]=true');
  }
  getSampleKarta() {
    return this._httpService.GET('/karta?filter[where][name]=Sample Karta&filter[where][sample]=true');
  }

  // deleteSharedKarta(id: any) {
  //   return this._httpService.POST('/karta/delete-shared-karta', id);
  // }
  getNode(nodeId: any) {
    return this._httpService.GET(`/karta_nodes/${nodeId}`);
  }
  addNode(data: any) {
    return this._httpService.POST('/karta_nodes', data);
  }
  addNodeByInventory(data: any) {
    return this._httpService.POST('/karta_nodes/add-node-by-inventory', data);
  }
  addNodeInCatalog(data: any) {
    return this._httpService.POST('/karta_catalogs', data);
  }
  getKPICalculation(data: any) {
    return this._httpService.POST('/karta_nodes/calculation-period', data);
  }
  addKartaHistory(data: any) {
    return this._httpService.POST('/karta_histories', data);
  }
  syncKartaHistory(data: any) {
    return this._httpService.POST('/karta_histories/sync-history', data);
  }
  getAllUsers() {
    return this._httpService.POST('/users/get-all');
  }
  createKartaHistory(data: any) {
    return this._httpService.POST('/karta_histories/create-karta-history', data);
  }
  createKartaLog(data: any) {
    return this._httpService.POST('/karta_logs', data);
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  updateNodeAndWeightage(data: any) {
    return this._httpService.PATCH('/karta_nodes/update-node', data);
  }
  updateKarta(kartaId: string, data: any) {
    return this._httpService.PATCH(`/karta/${kartaId}`, data);
  }

  deleteKarta(data: any) {
    return this._httpService.POST('/karta/delete', data);
  }
  removeNode(data: any) {
    return this._httpService.POST('/karta_nodes/delete', data);
  }
  shareKarta(data: any) {
    return this._httpService.POST('/karta/share', data);
  }
  copyKarta(data: any) {
    return this._httpService.POST('/karta/copy', data);
  }
  versionControlHistory(data: any){
    return this._httpService.POST('/karta_histories/version-control', data);
  }
  undoFunctionality(data: any) {
    return this._httpService.POST('/karta_histories/undo-control', data);
  }
  redoFunctionality(data: any) {
    return this._httpService.POST('/karta_histories/redo-control', data);
  }
  getColorSettingsByKarta(data: any) {
    return this._httpService.POST('/color_settings/by-user', data);
  }
  createColorSetting(data: any) {
    return this._httpService.POST('/color_settings', data);
  }
  updateColorSetting(data: any, settingId: string) {
    return this._httpService.PATCH(`/color_settings/${settingId}`, data);
  }
  toggleGlobalColorSetting(data: any) {
    return this._httpService.POST('/color_settings/toggle-global', data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
