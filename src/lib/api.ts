const isStaging = true;
const isAudit = true

export const API_BASE_URL = isAudit ? "https://criticalinfrastagingapi.globizsapp.com/api" : isStaging ? 'https://iprequeststagingapi.globizsapp.com/api' : 'https://iprequestapi.globizsapp.com/api'; 
