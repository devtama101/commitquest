/**
 * Create a webhook on a GitHub repository
 */
export async function createGitHubWebhook(
  accessToken: string,
  repoName: string,
  webhookUrl: string,
  secret: string
): Promise<{ id: string } | null> {
  const response = await fetch(
    `https://api.github.com/repos/${repoName}/hooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["push"],
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: secret,
          insecure_ssl: "0",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("GitHub webhook creation failed:", error);
    return null;
  }

  const data = await response.json();
  return { id: String(data.id) };
}

/**
 * Create a webhook on a GitLab project
 */
export async function createGitLabWebhook(
  accessToken: string,
  projectId: string,
  webhookUrl: string,
  secret: string
): Promise<{ id: string } | null> {
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectId)}/hooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        push_events: true,
        token: secret,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("GitLab webhook creation failed:", error);
    return null;
  }

  const data = await response.json();
  return { id: String(data.id) };
}

/**
 * Delete a webhook from a GitHub repository
 */
export async function deleteGitHubWebhook(
  accessToken: string,
  repoName: string,
  webhookId: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${repoName}/hooks/${webhookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return response.ok;
}

/**
 * Delete a webhook from a GitLab project
 */
export async function deleteGitLabWebhook(
  accessToken: string,
  projectId: string,
  webhookId: string
): Promise<boolean> {
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectId)}/hooks/${webhookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.ok;
}

/**
 * Fetch user's repositories from GitHub
 */
export async function fetchGitHubRepos(accessToken: string) {
  const repos: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&type=owner`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) break;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) break;

    repos.push(...data);
    if (data.length < perPage) break;
    page++;
  }

  return repos.map((repo) => ({
    id: repo.id.toString(),
    name: repo.full_name,
    url: repo.html_url,
    provider: "github" as const,
    permissions: repo.permissions,
  }));
}

/**
 * Fetch user's projects from GitLab
 */
export async function fetchGitLabProjects(accessToken: string) {
  const projects: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://gitlab.com/api/v4/projects?per_page=${perPage}&page=${page}&membership=true&order_by=last_activity_at&sort=desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) break;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) break;

    projects.push(...data);
    if (data.length < perPage) break;
    page++;
  }

  return projects.map((project) => ({
    id: project.id.toString(),
    name: project.path_with_namespace,
    url: project.web_url,
    provider: "gitlab" as const,
    permissions: {
      admin: project.permissions.project_access?.access_level >= 40 ||
             project.owner?.access_level >= 40,
    },
  }));
}
