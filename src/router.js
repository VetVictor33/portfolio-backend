const express = require('express');
require('dotenv').config();
const router = express();

const { MongoClient, ObjectId } = require('mongodb');
const validate = require('./middleware');
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

async function main() {
    console.log('Trying to connect to the database');
    const client = await MongoClient.connect(DB_URL).catch(() => console.log({ message: 'Error when connecting to database' }));
    const db = client.db(DB_NAME);
    const collectionProjects = db.collection("projects");
    const collectionCompEdu = db.collection("complementary_education");
    console.log('Successfully connected to the database');

    const getAllProjects = async (req, res) => {
        const projects = await collectionProjects.find().toArray().catch(() => res.status(500).json({ message: 'Error when connecting to database' }));
        res.status(200).json(projects)
    }

    const getProjectsById = async (req, res) => {
        const { id } = req.params;
        const project = await findByIdOnDb(id, collectionProjects).catch(() => res.status(500).json({ message: 'Error when connecting to database' }));

        if (project && project.errorMessage) return res.status(400).json({ message: project.errorMessage });
        if (!project) return res.status(404).json({ message: `The is no project with id ${id}` });

        return res.status(200).json(project)
    }

    const postProject = async (req, res) => {
        const { imgSrc, title, description, link, mobile, keywords, deploy } = req.body;
        if (!imgSrc || !title || !description || !link || mobile === undefined || !keywords) {
            return res.status(400).json({ message: "id, imgSrc, title, description, link, mobile and key are mandatory" });
        }

        const id = await getCurrentId(collectionProjects).catch(() => res.status(500).json({ message: 'Error when connecting to database' }));

        let project = { id, imgSrc, title, description, link };
        if (deploy) {
            project = { ...project, deploy, mobile, keywords };
        } else {
            project = { ...project, mobile, keywords }
        }
        const result = await collectionProjects.insertOne(project).catch(() => res.status(500).json({ message: 'Error when connecting to database' }));
        if (!result.acknowledged) {
            return res.status(500).json({ message: 'Não foi possível adicionar o projeto' });
        }

        return res.status(201).json(project);
    }

    const getAllCompEdu = async (req, res) => {
        const compEdu = await collectionCompEdu.find().toArray().catch(() => res.status(500).json({ message: 'Error when connecting to database' }));
        res.status(200).json(compEdu);
    }

    const getCompEduById = async (req, res) => {
        const { id } = req.params;
        const compEdu = await findByIdOnDb(id, collectionCompEdu).catch(() => res.status(500).json({ message: 'Error when connecting to database' }));
        res.status(200).json(compEdu);

    }

    const findByIdOnDb = async (id, collection) => {
        if (id.length !== 24) return { errorMessage: 'id needs to have 24 characters' }
        const response = await collection.findOne({ _id: new ObjectId(id) }).catch(() => console.log({ message: 'Error when connecting to database' }));;
        return response
    }

    async function getCurrentId(collection) {
        const itens = await collection.find().toArray().catch(() => console.log({ message: 'Error when connecting to database' }));
        const lastItem = itens.slice(-1);
        const { id } = lastItem[0];

        return id + 1
    }

    router.get('/', (req, res) => res.json('I AM COMPLEEETE'));

    router.get('/projects', getAllProjects);
    router.get('/projects/:id', getProjectsById);
    router.post('/projects', validate, postProject);

    router.get('/complementary-education', getAllCompEdu);
    router.get('/complementary-education/:id', getCompEduById);
}

main();


module.exports = router;