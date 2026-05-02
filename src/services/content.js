// ============================================================================
// CENTRALIZED CONTENT SERVICE
// ============================================================================
// This is your SINGLE interface for ALL data access across the entire app.
// All components should import from HERE, not directly from data files.
//
// Benefits:
// 1. When you migrate to a database, you ONLY change THIS file
// 2. No component needs to know where data comes from
// 3. Easy to add caching, filtering, sorting logic here
// 4. Single source of truth
//
// Usage in components:
//   import { contentService } from '@/services/content';
//   const experiences = await contentService.getExperiences();
// ============================================================================

import { experiences } from "../data/experiences";
import { storiesData } from "../data/stories";
import { aboutImages } from "../data/aboutImages";
import { notesIndex, getNoteBySlug as getNoteMock } from "../data/notes";

/**
 * Content Service
 * Single interface for all content data across the application
 *
 * Future migration: Replace the data imports with API calls to your database
 */
export const contentService = {
  // ==========================================================================
  // EXPERIENCES
  // ==========================================================================

  /**
   * Get all experiences with optional filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.category - Filter by category ('internship', 'leadership', 'consulting')
   * @param {boolean} filters.featured - Filter to only featured items
   * @param {boolean} filters.isActive - Filter to only active items (default: true)
   * @returns {Array} Array of experience objects
   */
  getExperiences(filters = {}) {
    let data = [...experiences];

    // Apply filters
    if (filters.category) {
      data = data.filter((exp) => exp.category === filters.category);
    }

    if (filters.featured !== undefined) {
      data = data.filter((exp) => exp.featured === filters.featured);
    }

    if (filters.isActive !== false) {
      data = data.filter((exp) => exp.isActive === true);
    }

    // Sort by sortOrder
    data.sort((a, b) => a.sortOrder - b.sortOrder);

    return data;
  },

  /**
   * Get a single experience by ID
   * @param {string} id - Experience ID
   * @returns {Object|null} Experience object or null if not found
   */
  getExperienceById(id) {
    const experience = experiences.find((exp) => exp.id === id);
    return experience || null;
  },

  // ==========================================================================
  // PROJECTS
  // ==========================================================================

  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.category - Filter by category
   * @param {boolean} filters.featured - Filter to only featured items
   * @param {boolean} filters.isActive - Filter to only active items (default: true)
   * @returns {Array} Array of project objects
   */
  getProjects(filters = {}) {
    let data = [...projects];

    if (filters.category) {
      data = data.filter((proj) => proj.category === filters.category);
    }

    if (filters.featured !== undefined) {
      data = data.filter((proj) => proj.featured === filters.featured);
    }

    if (filters.isActive !== false) {
      data = data.filter((proj) => proj.isActive === true);
    }

    // Sort by sortOrder
    data.sort((a, b) => a.sortOrder - b.sortOrder);

    return data;
  },

  /**
   * Get a single project by ID
   * @param {string} id - Project ID
   * @returns {Object|null} Project object or null if not found
   */
  getProjectById(id) {
    const project = projects.find((proj) => proj.id === id);
    return project || null;
  },

  // ==========================================================================
  // STORIES
  // ==========================================================================

  /**
   * Get all stories with optional filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.category - Filter by category
   * @param {string} filters.accent - Filter by accent color
   * @returns {Array} Array of story objects
   */
  getStories(filters = {}) {
    let data = [...storiesData];

    if (filters.category) {
      data = data.filter((story) => story.category === filters.category);
    }

    if (filters.accent) {
      data = data.filter((story) => story.accent === filters.accent);
    }

    return data;
  },

  /**
   * Get a single story by ID
   * @param {string} id - Story ID
   * @returns {Object|null} Story object or null if not found
   */
  getStoryById(id) {
    const story = storiesData.find((s) => s.id === id);
    return story || null;
  },

  // ==========================================================================
  // NOTES / CASE STUDIES
  // ==========================================================================

  /**
   * Get all notes
   * @returns {Array} Array of note objects
   */
  getNotes() {
    return [...notesIndex];
  },

  /**
   * Get a single note by slug
   * @param {string} slug - Note slug
   * @returns {Object|null} Note object or null if not found
   */
  getNoteBySlug(slug) {
    return getNoteMock(slug);
  },

  // ==========================================================================
  // ABOUT IMAGES
  // ==========================================================================

  /**
   * Get all about page images
   * @returns {Array} Array of image objects
   */
  getAboutImages() {
    return [...aboutImages];
  },

  // ==========================================================================
  // COMBINED / UTILITY METHODS
  // ==========================================================================

  /**
   * Get all content items (projects + stories) for display in carousels
   * Useful for homepage or combined views
   * @returns {Object} Object with projects and stories arrays
   */
  getAllContent() {
    return {
      projects: this.getProjects({ featured: true }),
      stories: this.getStories(),
    };
  },

  /**
   * Search across all content types
   * @param {string} query - Search query
   * @returns {Object} Object with matching results from each content type
   */
  search(query) {
    if (!query || query.trim() === "") {
      return {
        experiences: [],
        projects: [],
        stories: [],
        notes: [],
      };
    }

    const searchTerm = query.toLowerCase().trim();

    const allExperiences = this.getExperiences();
    const allProjects = this.getProjects();
    const allStories = this.getStories();
    const allNotes = this.getNotes();

    return {
      experiences: allExperiences.filter(
        (exp) =>
          exp.companyName.toLowerCase().includes(searchTerm) ||
          exp.position.toLowerCase().includes(searchTerm) ||
          exp.description.toLowerCase().includes(searchTerm),
      ),
      projects: allProjects.filter(
        (proj) =>
          proj.title.toLowerCase().includes(searchTerm) ||
          proj.description.toLowerCase().includes(searchTerm),
      ),
      stories: allStories.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTerm) ||
          story.category.toLowerCase().includes(searchTerm),
      ),
      notes: allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.summary.toLowerCase().includes(searchTerm),
      ),
    };
  },
};

export default contentService;

// ============================================================================
// FUTURE MIGRATION EXAMPLE
// ============================================================================
// When you're ready to connect to a database, replace the implementations above
// with actual API calls. For example:
//
// async getExperiences(filters = {}) {
//   const response = await fetch('/api/experiences', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(filters)
//   });
//   return response.json();
// }
//
// OR with Sanity:
//
// import { sanityClient } from './sanity';
//
// async getExperiences(filters = {}) {
//   const query = `*[_type == "experience" && isActive == true] | order(sortOrder asc)`;
//   return await sanityClient.fetch(query);
// }
//
// The beauty is: NO component needs to change. Only this file.
// ============================================================================
