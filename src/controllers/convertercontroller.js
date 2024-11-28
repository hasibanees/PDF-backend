const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const CloudConvert = require('cloudconvert');

// Replace this with your Zamzar API key
const zamzarApiKey = 'GiVUYsF4A8ssq93FR48H';

const cloudConvertJwtToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMzNlYjY5MmU2ZDkxMTZlYzhlY2E0ZTI0NWRiMTg4NjUwNjc0MjU4NzQ2ZDNjMDhlMzljYjg0YjFhYTBmNjc3YzgwNzJiMjljNDc4MzZiOGEiLCJpYXQiOjE3Mjk2MzU5ODEuMzk0Mjg2LCJuYmYiOjE3Mjk2MzU5ODEuMzk0Mjg3LCJleHAiOjQ4ODUzMDk1ODEuMzkwNzY3LCJzdWIiOiI2OTk2NDU1NCIsInNjb3BlcyI6WyJwcmVzZXQud3JpdGUiLCJwcmVzZXQucmVhZCIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJ0YXNrLndyaXRlIiwidGFzay5yZWFkIiwidXNlci53cml0ZSIsInVzZXIucmVhZCJdfQ.mHs9dVzcmThS3QAAuIqTQlloTXK2Ng0rT7Worun_MB62NGEAHdp3R-_DKZS21qamxa_Ja4LvDsLMzPY8CqL4ivKkxFA--4uwPuesglMSxggKgo8utoTDghPJIb5E3HS5b2vHNqIj7Bev-LfjJoCkpMM2ZAfVpupQPFkMtAGonrgT1JBDRm0i2Q74-kvdlI0qx5A04WYn9eJNZvwnyeBS6tkMEHRwybmryDhcRCNMa4pfCdwzxtS7rKoy0pBy2FTA1iPC-IMnnBq4ex4zOSk0-dNfu5Uj7AqzzEtWYAvrx47f7yWtEvXy5xQ4lBhETindwFKXdmMXYhYBgpuvmLJT2A-LvHBrGeXKV_XB65jTY7s_Tj3Sp88uA77Nmk7lVItVTjqz4Fl4O7K0Ss-aXxJsufk0L6_Wad3hc2EBkwvTtKMiZflXUJIUIB7u9uxCUTqCSeki0sIT9j1tFkjkpLYXpUz8PIH4h6p2qN6sFu4QQQTR0xQw2FPlRNvz9tCGGL1a-ZHU1d_5uvLKNqlQY54hir7QSOuqQ_RPzfLU9_cIdUL7NeQRlshP1ACPRJ_0QZCGwE5XtyEY-ZitRjYFk0F9SH3ZC71owdm3oVL7f16CSHTLa9BfD4CJKsvv4kyk3sBMivKFA2EZMoCHUFHB0mfByAOUZKxdtVmhrlzdEZk4pFo"
const cloudConvert = new CloudConvert('api_key', true);
// Function to create a conversion job (Word to PDF)

exports.convertToPDF = async (req, res) => {
    try {
        const file = req.file;
           
        // Step 1: Create a job
        const jobResponse = await axios.post('https://api.cloudconvert.com', {
            tasks: {
                'import-my-file': {
                    operation: 'import/upload'
                },
                'convert-my-file': {
                    operation: 'convert',
                    input: 'import-my-file',
                    output_format: 'pdf'
                },
                'export-my-file': {
                    operation: 'export/url',
                    input: 'convert-my-file'
                }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${cloudConvertJwtToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("hello this is responce",jobResponse);
        return
        const jobData = jobResponse.data;
        const uploadUrl = jobData.data.tasks.find(task => task.name === 'import-my-file').result.form.url;

        // Step 2: Upload the file to the provided URL
        const form = new FormData();
        form.append('file', fs.createReadStream(file.path));

        await axios.post(uploadUrl, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        res.status(200).json({
            message: 'File uploaded and conversion started successfully',
            jobId: jobData.data.id
        });

    } catch (error) {
        console.error('Error creating conversion job:', error);
        res.status(500).json({ error: 'Failed to create conversion job' });
    }
};

// Function to check the conversion job status
exports.checkJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;

        const response = await axios.get(`https://api.zamzar.com/v1/jobs/${jobId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${zamzarApiKey}:`).toString('base64')}`,
            },
        });

        res.status(200).json({
            message: 'Job status retrieved successfully',
            data: response.data,
        });
    } catch (error) {
        console.error('Error retrieving job status:', error);
        res.status(500).json({ error: 'Failed to retrieve job status' });
    }
};

// Function to download the converted PDF
exports.downloadPDF = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Get the job status to find the output file ID
        const jobResponse = await axios.get(`https://api.zamzar.com/v1/jobs/${jobId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${zamzarApiKey}:`).toString('base64')}`,
            },
        });

        const outputFile = jobResponse.data.target_files[0];
        const fileId = outputFile.id;

        // Download the file
        const fileResponse = await axios({
            url: `https://api.zamzar.com/v1/jobs/${fileId}/content`,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${zamzarApiKey}:`).toString('base64')}`,
            },
        });

        res.setHeader('Content-Disposition', `attachment; filename=${outputFile.name}`);
        fileResponse.data.pipe(res);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        res.status(500).json({ error: 'Failed to download PDF' });
    }
};
