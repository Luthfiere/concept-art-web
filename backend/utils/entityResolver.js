import ConceptArt from '../model/ConceptArtModel.js';
import Devlog from '../model/DevlogModel.js';
import JobPosting from '../model/JobPostingModel.js';

const RESOLVERS = {
  art: { get: (id) => ConceptArt.getById(id), del: (id) => ConceptArt.delete(id) },
  devlog: { get: (id) => Devlog.getById(id), del: (id) => Devlog.delete(id) },
  job: { get: (id) => JobPosting.getById(id), del: (id) => JobPosting.delete(id) },
};

export const SUPPORTED_ENTITIES = Object.keys(RESOLVERS);

export async function getEntity(entity_type, entity_id) {
  const r = RESOLVERS[entity_type];
  if (!r) return null;
  return r.get(entity_id);
}

export async function deleteEntity(entity_type, entity_id) {
  const r = RESOLVERS[entity_type];
  if (!r) return null;
  return r.del(entity_id);
}
