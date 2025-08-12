// Import core module to get inputs and handle output/errors
const core = require('@actions/core');

// Import GitHub context to access repository and event information
const github = require('@actions/github');

// Import Octokit REST client to interact with GitHub API
const { Octokit } = require('@octokit/rest');

// Import Giphy API client
const Giphy = require('giphy-api');

// Define the main function for the action
async function run() {
  try {
    // =============================
    // Step 1: Get Inputs
    // =============================

    // GitHub token for authenticating API requests (passed as input in action.yml)
    const githubToken = core.getInput('github-token');

    // Giphy API key for fetching a random "thank you" GIF
    const giphyApiKey = core.getInput('giphy-api-key');

    // =============================
    // Step 2: Initialize API Clients
    // =============================

    // Create an authenticated Octokit client using the GitHub token
    const octokit = new Octokit({ auth: githubToken });

    // Initialize Giphy API client with your Giphy API key
    const giphy = Giphy(giphyApiKey);

    // =============================
    // Step 3: Get Pull Request Info
    // =============================

    // Extract repository owner, repo name, and PR number from the GitHub context
    // github.context.issue is automatically populated during a PR event
    const { owner, repo, number: issue_number } = github.context.issue;

    // =============================
    // Step 4: Get Random GIF from Giphy
    // =============================

    // Request a random GIF with the tag "thank you"
    const prComment = await giphy.random('thank you');

    // =============================
    // Step 5: Post a Comment on the Pull Request
    // =============================

    // Post a comment to the pull request with a thank-you message and the GIF
    await octokit.issues.createComment({
      owner, // repo owner
      repo,  // repo name
      issue_number, // PR number
      body: [
        '### 🎉 Thank you for your contribution!',
        '',
        `![Giphy](${prComment.data.images.downsized.url})` // embed the GIF
      ].join('\n') // Join lines into one string
    });

    // =============================
    // Step 6: Set Output
    // =============================

    // Set the GIF URL as an output so it can be used in other workflow steps
    core.setOutput('comment-url', prComment.data.images.downsized.url);

  } catch (error) {
    // If any error occurs, fail the workflow with the error message
    core.setFailed(error.message);
  }
}

// Run the function
run();
