import topics = require('../topics');
import user = require('../user');
import utils = require('../utils');

interface PostTS {
    getPostsFromSet: (set: string, start: number, stop: number, uid: number, reverse: boolean)=> Promise<any>;
    isMain: (pids: number | number[]) => Promise<boolean | boolean[]>;
    getTopicFields: (pid: number, fields: string[]) => Promise<any>;
    generatePostPath: (pid: number, uid: number) => Promise<string | null>;
    generatePostPaths: (pids: number[], uid: number) => Promise<string[]>;
    getPidsFromSet: (set:string, start:number, stop:number, reverse:boolean) => Promise<number[]>;
    getPostsByPids:(pids:number[], uid: number) => Promise<string[]>;
    getPostsFields: (pids: number | number[], fields: string[]) => Promise<any>;
    getPostField: (pid: number, field: string) => Promise<any>;
    getPostIndices: (postData: any, uid: number) => Promise<any>;
}

//  eslint-disable-next-line @typescript-eslint/no-explicit-any
module.exports = function (Posts: PostTS) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.getPostsFromSet = async function (set: string, start: number, stop: number, uid: number, reverse: boolean) {
        const pids = await Posts.getPidsFromSet(set, start, stop, reverse);  // eslint-disable-line 
        const posts = await Posts.getPostsByPids(pids, uid); // eslint-disable-line 
        return await user.blocks.filter(uid, posts); // eslint-disable-line 
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.isMain = async function (pids: number | number[]) {
        const isArray = Array.isArray(pids);
        const processedPids = isArray ? (pids) : ([pids] as number[]);
        const postData = await Posts.getPostsFields(processedPids, ['tid']); // eslint-disable-line 
        const topicData = await topics.getTopicsFields(postData.map((t: any) => t.tid), ['mainPid']); // eslint-disable-line 
        const result = processedPids.map((pid: number, i: number) => {
            const parsedPid = parseInt(pid.toString(), 10);
            const parsedMainPid = parseInt(topicData[i].mainPid, 10); // eslint-disable-line 
            return parsedPid === parsedMainPid;
        });
        return isArray ? result : result[0];
    };

    Posts.getTopicFields = async function (pid: number, fields: string[]) { // eslint-disable-line 
        const tid = await Posts.getPostField(pid, 'tid'); // eslint-disable-line
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return await topics.getTopicFields(tid, fields);
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.generatePostPath = async function (pid: number, uid: number) {
        const paths = await Posts.generatePostPaths([pid], uid); // eslint-disable-line
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return Array.isArray(paths) && paths.length ? paths[0] : null;
    };

    Posts.generatePostPaths = async function (pids: number[], uid: number) { // eslint-disable-line
        const postData = await Posts.getPostsFields(pids, ['pid', 'tid']); // eslint-disable-line
        const tids = postData.map((post: any) => post && post.tid); // eslint-disable-line
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
        const [indices, topicData] = await Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            Posts.getPostIndices(postData, uid),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            topics.getTopicsFields(tids, ['slug']),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const paths = pids.map((pid: number, index: number) => {
            const slug = topicData[index] ? topicData[index].slug : null; // eslint-disable-line
            const postIndex = utils.isNumber(indices[index]) ? parseInt(indices[index].toString(), 10) + 1 : null; // eslint-disable-line
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (slug && postIndex) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `/topic/${slug}/${postIndex}`;
            }
            return null;
        });

        return paths;
    };
};
