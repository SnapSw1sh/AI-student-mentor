export function countDocuments(topic) {
  return (
    topic.documents.length +
    topic.subtopics.reduce((sum, subtopic) => sum + countDocuments(subtopic), 0)
  );
}
