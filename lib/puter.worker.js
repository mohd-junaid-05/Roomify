const PROJECT_PREFIEX = "roomify_project_";

const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const getUserId = async (userPuter) => {
  try {
    const user = await userPuter.auth.getUser();

    return user?.uuid || null;
  } catch (error) {
    console.error("error getUserId");
    return null;
  }
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user.puter;

    if (!userPuter) return jsonError(401, "Authentication failed");

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage)
      return jsonError(400, "Project not found");

    const payload = {
      ...project,
      updateAt: new Date().toISOString(),
    };

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication failed");

    const key = `${PROJECT_PREFIEX}${project.id}`;
    await userPuter.kv.set(key, payload);

    return { saved: true, id: project.id, project: payload };
  } catch (error) {
    return jsonError(500, `Failed to save project`, {
      message: e.message || "Unknown error",
    });
  }
});

router.get("/api/projects/list", async ({ user }) => {
  try {
    if (!user) return jsonError(401, "Authentication failed");
    
    const userPuter = user.puter;

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication failed");

    const keys = await userPuter.kv.list(`${PROJECT_PREFIEX}*`);
    const projects = await Promise.all(
      keys.map((key) => userPuter.kv.get(key))
    );

    return { projects };
  } catch (error) {
    return jsonError(500, "Failed to list projects", {
      message: error.message || "Unknown error",
    });
  }
});

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user.puter;

    if (!userPuter) return jsonError(401, "Authentication failed");

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication failed");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return jsonError(400, "Missing required parameter: id");

    const key = `${PROJECT_PREFIEX}${id}`;
    const project = await userPuter.kv.get(key);

    if (!project) return jsonError(404, "Project not found");

    return { project };
  } catch (error) {
    return jsonError(500, "Failed to get project", {
      message: error.message || "Unknown error",
    });
  }
});
