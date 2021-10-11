require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('POST endpoint create todo', async() => {

      const expectation =
        {
          id: expect.any(Number),
          todo_description: expect.any(String),
          is_complete: expect.any(Boolean),
          owner_id: expect.any(Number)
        };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send({
          todo_description: 'New todo'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expect.arrayContaining([expectation]));
    });

    test('GET endpoint retrieves todos', async() => {

      const expectation =
        {
          id: expect.any(Number),
          todo_description: expect.any(String),
          is_complete: expect.any(Boolean),
          owner_id: expect.any(Number)
        };

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expect.arrayContaining([expectation]));
    });

    
    test('PUT endpoint updates a specific todo', async() => {

      const expectation =
        {
          id: expect.any(Number),
          todo_description: expect.any(String),
          is_complete: true,
          owner_id: expect.any(Number)
        };

      const returningData = await fakeRequest(app)
        .put('/api/todos/4')
        .set('Authorization', token)
        .send({
          todo_description: 'New todo',
          is_complete: true
        })
        .expect('Content-Type', /json/)
        .expect(200);

      // const trueData = await fakeRequest(app)s
      //   .get('/api/todos')
      //   .set('Authorization', token)
      //   .expect('Content-Type', /json/)
      //   .expect(200);

      expect(returningData.body).toEqual(expect.arrayContaining([expectation]));
      // expect(trueData.body).toEqual(expect.arrayContaining([expectation]));
    });


    test('DELETE endpoint deletes a specific todo', async() => {

      const expectation =
        {
          id: expect.any(Number),
          todo_description: expect.any(String),
          is_complete: expect.any(Boolean),
          owner_id: expect.any(Number)
        };

      const returningData = await fakeRequest(app)
        .delete('/api/todos/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      // const trueData = await fakeRequest(app)s
      //   .get('/api/todos')
      //   .set('Authorization', token)
      //   .expect('Content-Type', /json/)
      //   .expect(200);

      expect(returningData.body).toEqual(expect.arrayContaining([expectation]));
      // expect(trueData.body).toEqual(expect.arrayContaining([expectation]));
    });
  });
});
