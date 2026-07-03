const fetch = require('node-fetch');

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`;

/**
 * Get text embedding from Hugging Face API
 * @param {string} text - Input text to embed
 * @returns {number[]|null} Embedding vector or null on failure
 */
const getEmbedding = async (text) => {
  if (!HF_API_KEY || !text) return null;

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
      timeout: 15000,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`HF API returned ${response.status}: ${errText}`);
      return null;
    }

    const data = await response.json();

    // Handle nested array (batch) vs flat array responses
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        return data[0]; // Nested: [[0.1, 0.2, ...]]
      }
      return data; // Flat: [0.1, 0.2, ...]
    }

    return null;
  } catch (error) {
    console.warn('Hugging Face embedding error (using fallback):', error.message);
    return null;
  }
};

/**
 * Compute cosine similarity between two vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Cosine similarity [-1, 1]
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Convert a skills array to a flat string for embedding
 * @param {Array<{name: string}>|string[]} skills
 * @returns {string}
 */
const getSkillText = (skills) => {
  if (!skills || skills.length === 0) return '';
  return skills
    .map((s) => (typeof s === 'string' ? s : s.name))
    .filter(Boolean)
    .join(', ');
};

/**
 * Keyword-based fallback similarity when HF API is unavailable
 * @param {string[]} projectSkills
 * @param {Array<{name: string}>} freelancerSkills
 * @returns {number} Overlap score [0, 1]
 */
const keywordSimilarity = (projectSkills, freelancerSkills) => {
  if (!projectSkills?.length || !freelancerSkills?.length) return 0;

  const normalizedProjectSkills = projectSkills.map((s) => s.toLowerCase().trim());
  const normalizedFreelancerSkills = freelancerSkills.map((s) =>
    (typeof s === 'string' ? s : s.name).toLowerCase().trim()
  );

  const matches = normalizedFreelancerSkills.filter((fs) =>
    normalizedProjectSkills.some(
      (ps) => ps.includes(fs) || fs.includes(ps)
    )
  );

  return matches.length / Math.max(normalizedProjectSkills.length, 1);
};

/**
 * Match freelancers to a project using semantic similarity + composite scoring
 * @param {Object} project - Project document with requiredSkills
 * @param {Object[]} freelancers - Array of freelancer profiles with user data
 * @returns {Object[]} Top 10 matched freelancers with scores
 */
const matchFreelancersToProject = async (project, freelancers) => {
  if (!freelancers || freelancers.length === 0) return [];

  const projectSkillText = (project.requiredSkills || []).join(', ');
  let projectEmbedding = project.skillEmbedding?.length
    ? project.skillEmbedding
    : await getEmbedding(projectSkillText);

  const scored = await Promise.all(
    freelancers.map(async (freelancer) => {
      let skillScore = 0;

      if (projectEmbedding && freelancer.skillEmbedding?.length) {
        // Use semantic similarity via Hugging Face embeddings
        skillScore = Math.max(0, cosineSimilarity(projectEmbedding, freelancer.skillEmbedding));
      } else {
        // Fallback: keyword matching
        skillScore = keywordSimilarity(
          project.requiredSkills || [],
          freelancer.skills || []
        );
      }

      // Availability bonus (10%)
      const availabilityBonus = freelancer.availability === 'available' ? 1 : 0;

      // Normalize ratings (0-5 → 0-1)
      const ratingScore = (freelancer.averageRating || 0) / 5;

      // Normalize completed projects (cap at 50 → 0-1)
      const completedScore = Math.min((freelancer.completedProjects || 0) / 50, 1);

      // Composite score
      const compositeScore =
        skillScore * 0.6 +
        ratingScore * 0.2 +
        completedScore * 0.1 +
        availabilityBonus * 0.1;

      return {
        freelancer,
        skillScore: parseFloat(skillScore.toFixed(4)),
        compositeScore: parseFloat(compositeScore.toFixed(4)),
      };
    })
  );

  // Sort descending by composite score, return top 10
  return scored
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 10);
};

/**
 * Generate embedding for an entity and store it in the database
 * @param {string} entityId - MongoDB document ID
 * @param {string} skillText - Text to embed
 * @param {Object} Model - Mongoose model
 * @returns {boolean} Success status
 */
const generateAndStoreEmbedding = async (entityId, skillText, Model) => {
  try {
    const embedding = await getEmbedding(skillText);
    if (!embedding) return false;

    await Model.findByIdAndUpdate(entityId, { skillEmbedding: embedding });
    return true;
  } catch (error) {
    console.warn('generateAndStoreEmbedding error:', error.message);
    return false;
  }
};

module.exports = {
  getEmbedding,
  cosineSimilarity,
  getSkillText,
  matchFreelancersToProject,
  generateAndStoreEmbedding,
};
