const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  let issueId; // Variable to store issue ID for update and delete tests

  // Test for creating an issue with every field
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post('/api/issues/test_project')
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Tester',
        assigned_to: 'Assignee',
        status_text: 'Status'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Assignee');
        assert.equal(res.body.status_text, 'Status');
        assert.property(res.body, '_id');
        issueId = res.body._id; // Store the issue ID for later tests
        done();
      });
  });

  // Test for creating an issue with only required fields
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post('/api/issues/test_project')
      .send({
        issue_title: 'Title Only',
        issue_text: 'Text Only',
        created_by: 'Tester Only'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.issue_title, 'Title Only');
        assert.equal(res.body.issue_text, 'Text Only');
        assert.equal(res.body.created_by, 'Tester Only');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });

  // Test for creating an issue with missing required fields
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post('/api/issues/test_project')
      .send({
        issue_title: 'Missing Fields'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // Test for viewing issues on a project
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get('/api/issues/test_project')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        done();
      });
  });

  // Test for viewing issues on a project with one filter
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get('/api/issues/test_project')
      .query({ issue_title: 'Title' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].issue_title, 'Title');
        done();
      });
  });

  // Test for viewing issues on a project with multiple filters
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get('/api/issues/test_project')
      .query({ issue_title: 'Title', created_by: 'Tester' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].issue_title, 'Title');
        assert.equal(res.body[0].created_by, 'Tester');
        done();
      });
  });

  // Test for updating one field on an issue
  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/test_project')
      .send({
        _id: issueId,
        issue_text: 'Updated text'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Test for updating multiple fields on an issue
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/test_project')
      .send({
        _id: issueId,
        issue_text: 'Updated text again',
        status_text: 'In progress'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Test for updating an issue with missing _id
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/test_project')
      .send({ issue_text: 'Missing ID' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test for updating an issue with no fields to update
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/test_project')
      .send({ _id: issueId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // Test for updating an issue with an invalid _id
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put('/api/issues/test_project')
      .send({ _id: 'invalid_id', issue_text: 'Invalid ID' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  // Test for deleting an issue
  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete('/api/issues/test_project')
      .send({ _id: issueId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  // Test for deleting an issue with an invalid _id
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete('/api/issues/test_project')
      .send({ _id: 'invalid_id' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  // Test for deleting an issue with missing _id
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete('/api/issues/test_project')
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
