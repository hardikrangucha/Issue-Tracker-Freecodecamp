'use strict';

const { v4: uuidv4 } = require('uuid'); // For generating unique IDs (you'll need to install uuid package)
const issues = {}; // This object will store issues by project name (you'll likely replace this with a database)

// Helper function to filter issues based on query parameters
const filterIssues = (projectIssues, query) => {
  return projectIssues.filter(issue => {
    return Object.keys(query).every(key => issue[key] == query[key]);
  });
};

module.exports = function (app) {

  app.route('/api/issues/:project')

    // GET route to view issues on a project
    .get(function (req, res) {
      const project = req.params.project;
      const query = req.query;

      // If the project doesn't exist, return an empty array
      if (!issues[project]) {
        return res.json([]);
      }

      // Filter issues based on query parameters (if any)
      const filteredIssues = filterIssues(issues[project], query);
      res.json(filteredIssues);
    })

    // POST route to create a new issue
    .post(function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      // Check for missing required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      // Create the new issue object
      const newIssue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };

      // Initialize project if not already present
      if (!issues[project]) {
        issues[project] = [];
      }

      // Add the new issue to the project
      issues[project].push(newIssue);

      // Respond with the created issue
      res.json(newIssue);
    })

    // PUT route to update an issue
    .put(function (req, res) {
      const project = req.params.project;
      const { _id, ...updateFields } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Check if there are any fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      // Find the issue by _id in the project
      const projectIssues = issues[project] || [];
      const issue = projectIssues.find(issue => issue._id === _id);

      // If issue is not found, return an error
      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      // Update the issue fields
      Object.keys(updateFields).forEach(field => {
        if (updateFields[field]) {
          issue[field] = updateFields[field];
        }
      });

      issue.updated_on = new Date(); // Update the updated_on field

      res.json({ result: 'successfully updated', _id });
    })

    // DELETE route to delete an issue
    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Find and remove the issue by _id in the project
      const projectIssues = issues[project] || [];
      const issueIndex = projectIssues.findIndex(issue => issue._id === _id);

      // If issue is not found, return an error
      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      // Remove the issue from the project
      projectIssues.splice(issueIndex, 1);

      res.json({ result: 'successfully deleted', _id });
    });

};
