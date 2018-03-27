'use strict';

import { HttpHeaders } from '@angular/common/http';

export const apiUrl = "/api";
export const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
