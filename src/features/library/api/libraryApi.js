import { httpClient } from '../../../shared/api/httpClient';

export const libraryApi = {
  getTree: () => httpClient.get('/library/tree'),
  getDocument: (documentId) => httpClient.get(`/documents/${documentId}`),
  getDocumentPreview: (documentId) => httpClient.getBlob(`/documents/${documentId}/preview`),
  getDocumentDownload: (documentId) => httpClient.getBlob(`/documents/${documentId}/download`),
};
