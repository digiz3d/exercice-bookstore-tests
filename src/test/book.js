import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';
import path from 'path';
import nock from 'nock';

import server from '../server';
import resetDatabase from '../utils/resetDatabase';

const initialStructure = {
    books: []
};

const mockedDatabase = {
    books: [
        {
            id: '0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9',
            title: 'Coco raconte Channel 2',
            years: 1990,
            pages: 400
        }
    ]
};

chai.use(chaiHttp);
chai.use(chaiNock);
chai.use(chaiAsPromised);

// tout les packages et fonction nescessaire au test sont importé ici, bon courage

// fait les Tests d'integration en premier

describe("Empty Database", () => {
    beforeEach("reset database", () => {
        resetDatabase(path.join(__dirname, '../data/books.json'), initialStructure);
    });

    it("GET /book", done => {
        chai
            .request(server)
            .get('/book')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.books).to.be.a('array');
                expect(res.body.books.length).to.equal(0);
                done();
            });
    });

    it("POST /book", done => {
        chai
            .request(server)
            .post('/book')
            // .type('form')
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                title: 'la poste',
                years: 1994,
                pages: 69
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('book successfull added'); //erreur ici
                done();
            });
    });
});

describe("Mocked Database", () => {
    beforeEach("reset database", () => {
        resetDatabase(path.join(__dirname, '../data/books.json'), mockedDatabase);
    });

    it("PUT /book/:id", done => {
        chai
            .request(server)
            .put('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
                title: 'something',
                years: 1337,
                pages: 42
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('book successfully updated');
                done();
            });
    });

    it("DELETE /book/:id", done => {
        chai
            .request(server)
            .delete('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('book successfully deleted');
                done();
            });
    });

    it("GET /book/:id", done => {
        chai
            .request(server)
            .get('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body.message).to.equals('book fetched');
                expect(res.body).to.be.a('object');
                expect(res.body.book.title).to.be.a('string');
                expect(res.body.book.title).to.equals(mockedDatabase.books[0].title);
                expect(res.body.book.years).to.be.a('number');
                expect(res.body.book.years).to.equals(mockedDatabase.books[0].years);
                expect(res.body.book.pages).to.be.a('number');
                expect(res.body.book.pages).to.equals(mockedDatabase.books[0].pages);
                done();
            });
    });
});

describe("simulation de bonnes réponses de l'API", () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    it("GET /book", done => {
        nock('http://localhost:8080')
            .get('/book')
            .reply(200, { books: [] });

        chai
            .request('http://localhost:8080')
            .get('/book')
            .end((err, res) => {
                expect(res).to.have.a.status(200);
                expect(res.body.books).to.be.a('array');
                done();
            });
    });

    it("GET /book/:id", done => {
        nock('http://localhost:8080')
            .get('/book/testid')
            .reply(200, {
                message: 'book fetched',
                book: { "id": "0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9", "title": "Coco raconte Channel 2", "years": 1990, "pages": 400 }
            });

        chai
            .request('http://localhost:8080')
            .get('/book/testid')
            .end((err, res) => {
                expect(res).to.have.a.status(200);
                expect(res.body.message).to.be.equal('book fetched');
                expect(res.body.book).to.be.an('object');
                done();
            });
    });

    it("POST", done => {
        nock('http://localhost:8080')
            .post('/book')
            .reply(200, { message: 'book successfully added' });

        chai
            .request('http://localhost:8080')
            .post('/book')
            .end((err, res) => {
                expect(res).to.have.a.status(200);
                expect(res.body.message).to.equal('book successfully added');
                done();
            });
    });

    it("PUT /book/:id", done => {
        nock('http://localhost:8080')
            .put('/book/testid')
            .reply(200, { message: 'book successfully updated' });

        chai
            .request('http://localhost:8080')
            .put('/book/testid')
            .end((err, res) => {
                expect(res).to.have.a.status(200);
                expect(res.body.message).to.equal('book successfully updated');
                done();
            });
    });

    it("DELETE /book/:id", done => {
        nock('http://localhost:8080')
            .delete('/book/testid')
            .reply(200, { message: 'book successfully deleted' });

        chai
            .request('http://localhost:8080')
            .delete('/book/testid')
            .end((err, res) => {
                expect(res).to.have.a.status(200);
                expect(res.body.message).to.equal('book successfully deleted');
                done();
            });
    });
});

describe("simulation de mauvaise réponses de l'API", () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    it("GET /book", done => {
        nock('http://localhost:8080')
            .get('/book')
            .reply(400, { message: 'error fetching books' });

        chai
            .request('http://localhost:8080')
            .get('/book')
            .end((err, res) => {
                expect(res).to.have.a.status(400);
                expect(res.body.message).to.equals('error fetching books');
                done();
            });
    });

    it("GET /book/:id", done => {
        nock('http://localhost:8080')
            .get('/book/testid')
            .reply(400, {
                message: 'error fetching the book'
            });

        chai
            .request('http://localhost:8080')
            .get('/book/testid')
            .end((err, res) => {
                expect(res).to.have.a.status(400);
                expect(res.body.message).to.be.equal('error fetching the book');
                done();
            });
    });

    it("POST", done => {
        nock('http://localhost:8080')
            .post('/book')
            .reply(400, { message: 'error adding the book' });

        chai
            .request('http://localhost:8080')
            .post('/book')
            .end((err, res) => {
                expect(res).to.have.a.status(400);
                expect(res.body.message).to.equal('error adding the book');
                done();
            });
    });

    it("PUT /book/:id", done => {
        nock('http://localhost:8080')
            .put('/book/testid')
            .reply(400, { message: 'error updating the book' });

        chai
            .request('http://localhost:8080')
            .put('/book/testid')
            .end((err, res) => {
                expect(res).to.have.a.status(400);
                expect(res.body.message).to.equal('error updating the book');
                done();
            });
    });

    it("DELETE /book/:id", done => {
        nock('http://localhost:8080')
            .delete('/book/testid')
            .reply(400, { message: 'error deleting the book' });

        chai
            .request('http://localhost:8080')
            .delete('/book/testid')
            .end((err, res) => {
                expect(res).to.have.a.status(400);
                expect(res.body.message).to.equal('error deleting the book');
                done();
            });
    });
}); 