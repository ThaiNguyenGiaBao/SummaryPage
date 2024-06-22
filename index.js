const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const { get } = require("http");
require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const username = "Huy-DNA";
const data = {};

async function getUserInfo(username) {
  let user, userRepos;
  try {
    user = await octokit.users.getByUsername({
      username: username,
    });
    userRepos = await octokit.repos.listForUser({
      username: username,
      sort: "updated",
    });
  } catch (err) {
    console.log("Error: ", err);
  }

  //console.log(userRepos);

  // Basic info
  data.username = user.data.login;
  data.name = user.data.name;
  data.avatar = user.data.avatar_url;

  // Contact info
  data.email = user.data.email;
  data.bio = user.data.bio;

  // Social media
  data.twitter = user.data.twitter_username;

  // Professional info
  data.company = user.data.company;
  data.location = user.data.location;
  data.blog = user.data.blog;

  // Statistics
  data.followers = user.data.followers;
  data.following = user.data.following;

  // Recent Activity
  data.repos = [];
  for (let i = 0; i < 5; i++) {
    data.repos.push({
      name: userRepos.data[i].name,
      description: userRepos.data[i].description,
      stars: userRepos.data[i].stargazers_count,
      forks: userRepos.data[i].forks,
    });
  }
  data.stars = 0;
  data.forks = 0;

  userRepos.data.forEach((repo) => {
    data.stars += repo.stargazers_count;
    data.forks += repo.forks;
  });

  // Memberships
  data.organizations = [];
  const orgs = await octokit.orgs.listForUser({
    username: username,
  });
  orgs.data.forEach((org) => {
    data.organizations.push({
      name: org.login,
      avatar: org.avatar_url,
    });
  });

  // Preference languages
  languages = {};
  userRepos.data.forEach((repo) => {
    if (repo.language) {
      if (languages[repo.language]) {
        languages[repo.language]++;
      } else {
        languages[repo.language] = 1;
      }
    }
  });
  data.languages = languages;

  // Write to file JSON
  fs.writeFileSync("data.json", JSON.stringify(data));
  //console.log(data);
}

getUserInfo(username);
