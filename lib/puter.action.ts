import puter from '@heyputer/puter.js'
import { getorCreateHostingConfig, uploadImageToHosting } from './puter.hosting';
import { isHostedUrl } from './utils';
import { PUTER_WORKER_URL } from './constants';

export const signIn  = async () => await puter.auth.signIn();
export const signOut = ()       => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser()
    } catch {
        return null
    }
}
//getCurrentUser
export const createProject = async ({item, visibility}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    if(!PUTER_WORKER_URL){
        console.warn('Missing ; skip history fetch')
        return null;
    }
    
    const projectId = item.id;
    console.log("Project Id",projectId)

    const hosting = await getorCreateHostingConfig();
    const hostedSource = projectId ? await uploadImageToHosting({hosting, url: item.sourceImage, projectId, label: 'source',}) : null;

    const hostedRender = projectId && item.renderedImage ?
    await uploadImageToHosting({
        hosting, url: item.renderedImage, projectId, label: 'rendered',}): null;
    
    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '')

    if(!resolvedSource) {
        console.warn(`failed to host source image skipping save.`)
        return null;
    }

    const resolvedRender = hostedRender?.url ? hostedRender?.url : item.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined

    const {
        sourcePath : _sourcePath,
        renderedPath : _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage : resolvedSource,
        renderedImage : resolvedRender,
    }
    try {

        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, { 
            method: 'POST',
            headers : {'Content-Type': 'application/json'},
            body : JSON.stringify({
                project : payload, visibility
            })

        
        })

        if(!response.ok) {
            console.error('Failed to save project', await response.text())
            return null
        }

        const data = (await response.json()) as {project?: DesignItem | null}
        return data?.project ?? null;
    } catch (error) {
        console.log("failed to save project", error)
        return null
    }
}
// getProjects
export const getProjects = async () => {

    if(!PUTER_WORKER_URL){
        console.warn('Missing ; skip history fetch')
        return [];
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, {method: 'GET'})

        if(!response.ok) {
            console.error('Failed to fetch history', await response.text())
            return []
        }

        const data = await response.json() as { projects?: DesignItem[] | null}
        return Array.isArray(data?.projects) ? data.projects : [];
    } catch(e) {
        console.error('Failed to get projects for siging in', e);
        return []
    }



    
}


export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};

