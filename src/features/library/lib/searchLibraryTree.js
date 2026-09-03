export function searchLibraryTree(tree, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results = [];

  function walk(topic, ancestorPath) {
    if (topic.name.toLowerCase().includes(normalized)) {
      results.push({ type: 'topic', id: topic.id, title: topic.name, path: ancestorPath });
    }

    const topicPath = [...ancestorPath, { id: topic.id, name: topic.name }];

    topic.documents.forEach((document) => {
      if (document.title.toLowerCase().includes(normalized)) {
        results.push({ type: 'document', id: document.id, title: document.title, path: topicPath });
      }
    });

    topic.subtopics.forEach((subtopic) => walk(subtopic, topicPath));
  }

  tree.forEach((topic) => walk(topic, []));

  return results;
}
