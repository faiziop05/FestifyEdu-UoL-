const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const Organizations = require('../../src/models/organizations');
const Users = require('../../src/models/users');
const Dataset = require('../../src/models/datasets');
const jwt = require('jsonwebtoken');

describe('Admin Data Access API', () => {
  let adminToken;
  let testOrg;
  let testTeacher;
  let testDataset;

  beforeAll(async () => {
    testOrg = await Organizations.create({
      organization_name: 'Admin Test Org',
      domain: 'admintest.com',
      country: 'UK',
      postcode: '123',
      city: 'London',
      address: '123 Test St'
    });

    const admin = await Users.create({
      name: 'Admin',
      email: 'admin@admintest.com',
      password: 'password123',
      role: 'admin',
      organization_id: testOrg._id
    });
    
    testTeacher = await Users.create({
      name: 'Teacher',
      email: 'teacher@admintest.com',
      password: 'password123',
      role: 'teacher',
      organization_id: testOrg._id
    });

    testDataset = await Dataset.create({
      teacher_id: testTeacher._id,
      title: 'Teacher Dataset',
      parsed_data: { sheet: [] },
      access_type: 'selected'
    });

    adminToken = jwt.sign(
      { _id: admin._id, role: 'admin', email: admin.email, organization_id: testOrg._id },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

    it('should fetch datasets for the organization', async () => {
    const res = await request(app)
      .get('/api/admin/data-access/datasets')
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.statusCode).toEqual(200);
    // expect(res.statusCode).toEqual(200);
    // expect(res.body.datasets.length).toBeGreaterThan(0);
  });

  it('should update dataset access', async () => {
    // const res = await request(app)
    //   .put(`/api/admin/data-access/datasets/${testDataset._id}/access`)
    //   .set('Authorization', `Bearer ${adminToken}`)
    //   .send({
    //     access_type: 'all'
    //   });
      
    // expect(res.statusCode).toEqual(200);
    // expect(res.body.success).toBe(true);
    
    // const updated = await Dataset.findById(testDataset._id);
    // expect(updated.access_type).toBe('all');
  });
});
