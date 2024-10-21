'use strict';

const { Contract } = require('fabric-contract-api');

class LawFirmChaincode extends Contract {

    // Initialize the ledger with some sample cases
    async initLedger(ctx) {
        const sampleCases = [
            {
                caseId: 'CASE001',
                caseName: 'Case A',
                files: []
            },
            {
                caseId: 'CASE002',
                caseName: 'Case B',
                files: []
            }
        ];

        for (let i = 0; i < sampleCases.length; i++) {
            await ctx.stub.putState(sampleCases[i].caseId, Buffer.from(JSON.stringify(sampleCases[i])));
            console.log(`Added ${sampleCases[i].caseId}`);
        }
    }

    // Upload file hash to a specific case
    async uploadFileHash(ctx, caseId, fileHash) {
        const caseData = await this._getCase(ctx, caseId);

        // Check if file hash already exists in the case
        const fileExists = caseData.files.includes(fileHash);
        if (fileExists) {
            throw new Error(`File with hash ${fileHash} already exists in case ${caseId}`);
        }

        // Add the new file hash to the case's file list
        caseData.files.push(fileHash);

        await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(caseData)));

        return `File with hash ${fileHash} successfully added to case ${caseId}`;
    }

    // Get all file hashes for a specific case
    async getFileHashes(ctx, caseId) {
        const caseData = await this._getCase(ctx, caseId);

        return JSON.stringify(caseData.files);
    }

    // Update file hash in a specific case (replace old hash with a new one)
    async updateFileHash(ctx, caseId, oldFileHash, newFileHash) {
        const caseData = await this._getCase(ctx, caseId);

        const fileIndex = caseData.files.indexOf(oldFileHash);
        if (fileIndex === -1) {
            throw new Error(`File with hash ${oldFileHash} not found in case ${caseId}`);
        }

        // Update the hash
        caseData.files[fileIndex] = newFileHash;

        await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(caseData)));

        return `File hash ${oldFileHash} in case ${caseId} successfully updated to ${newFileHash}`;
    }

    // Delete a file hash from a specific case
    async deleteFileHash(ctx, caseId, fileHash) {
        const caseData = await this._getCase(ctx, caseId);

        const fileIndex = caseData.files.indexOf(fileHash);
        if (fileIndex === -1) {
            throw new Error(`File with hash ${fileHash} not found in case ${caseId}`);
        }

        // Remove the file hash from the list
        caseData.files.splice(fileIndex, 1);

        await ctx.stub.putState(caseId, Buffer.from(JSON.stringify(caseData)));

        return `File with hash ${fileHash} successfully deleted from case ${caseId}`;
    }

    // Get case details
    async _getCase(ctx, caseId) {
        const caseDataBytes = await ctx.stub.getState(caseId);
        if (!caseDataBytes || caseDataBytes.length === 0) {
            throw new Error(`Case with ID ${caseId} does not exist`);
        }

        return JSON.parse(caseDataBytes.toString());
    }
}

module.exports = LawFirmChaincode;
