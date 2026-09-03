import { useCallback, useEffect, useMemo, useState } from 'react';
import { libraryApi } from '../api/libraryApi';
import { LibraryContext } from './LibraryContext.js';

function walkTopic(topic, ancestors, topicsById, documentsById, pathsById) {
  const path = [...ancestors, { id: topic.id, name: topic.name }];
  topicsById.set(topic.id, topic);
  pathsById.set(topic.id, path);

  topic.documents.forEach((document) => {
    documentsById.set(document.id, { document, topic });
    pathsById.set(document.id, path);
  });

  topic.subtopics.forEach((subtopic) =>
    walkTopic(subtopic, path, topicsById, documentsById, pathsById),
  );
}

function buildIndices(tree) {
  const topicsById = new Map();
  const documentsById = new Map();
  const pathsById = new Map();

  tree.forEach((topic) => walkTopic(topic, [], topicsById, documentsById, pathsById));

  return { topicsById, documentsById, pathsById };
}

export function LibraryProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [tree, setTree] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await libraryApi.getTree();
      setTree(Array.isArray(data) ? data : []);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const { topicsById, documentsById, pathsById } = useMemo(() => buildIndices(tree), [tree]);

  const getTopic = useCallback((id) => topicsById.get(id) ?? null, [topicsById]);
  const getDocument = useCallback((id) => documentsById.get(id) ?? null, [documentsById]);
  const getPath = useCallback((id) => pathsById.get(id) ?? [], [pathsById]);

  const value = useMemo(
    () => ({ tree, status, error, refetch: load, getTopic, getDocument, getPath }),
    [tree, status, error, load, getTopic, getDocument, getPath],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
