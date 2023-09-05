"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const topics = require("../topics");
const user = require("../user");
const utils = require("../utils");
//  eslint-disable-next-line @typescript-eslint/no-explicit-any
module.exports = function (Posts) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.getPostsFromSet = function (set, start, stop, uid, reverse) {
        return __awaiter(this, void 0, void 0, function* () {
            const pids = yield Posts.getPidsFromSet(set, start, stop, reverse); // eslint-disable-line 
            const posts = yield Posts.getPostsByPids(pids, uid); // eslint-disable-line 
            return yield user.blocks.filter(uid, posts); // eslint-disable-line 
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.isMain = function (pids) {
        return __awaiter(this, void 0, void 0, function* () {
            const isArray = Array.isArray(pids);
            const processedPids = isArray ? (pids) : [pids];
            const postData = yield Posts.getPostsFields(processedPids, ['tid']); // eslint-disable-line 
            const topicData = yield topics.getTopicsFields(postData.map((t) => t.tid), ['mainPid']); // eslint-disable-line 
            const result = processedPids.map((pid, i) => {
                const parsedPid = parseInt(pid.toString(), 10);
                const parsedMainPid = parseInt(topicData[i].mainPid, 10); // eslint-disable-line 
                return parsedPid === parsedMainPid;
            });
            return isArray ? result : result[0];
        });
    };
    Posts.getTopicFields = function (pid, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const tid = yield Posts.getPostField(pid, 'tid'); // eslint-disable-line
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return yield topics.getTopicFields(tid, fields);
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Posts.generatePostPath = function (pid, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = yield Posts.generatePostPaths([pid], uid); // eslint-disable-line
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return Array.isArray(paths) && paths.length ? paths[0] : null;
        });
    };
    Posts.generatePostPaths = function (pids, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = yield Posts.getPostsFields(pids, ['pid', 'tid']); // eslint-disable-line
            const tids = postData.map((post) => post && post.tid); // eslint-disable-line
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
            const [indices, topicData] = yield Promise.all([
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                Posts.getPostIndices(postData, uid),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                topics.getTopicsFields(tids, ['slug']),
            ]);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const paths = pids.map((pid, index) => {
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
        });
    };
};
