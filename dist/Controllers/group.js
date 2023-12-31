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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAdmin = exports.removeUser = exports.getMembers = exports.getGroups = exports.addGroup = void 0;
const user_1 = __importDefault(require("../Models/user"));
const group_1 = __importDefault(require("../Models/group"));
const userGroup_1 = __importDefault(require("../Models/userGroup"));
const addGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupDetails = Object.assign({}, req.body);
    groupDetails.userIds.push(req.user.id);
    // console.log(groupDetails);
    try {
        // Create the group
        const group = yield group_1.default.create({
            groupname: groupDetails.groupName
        });
        // Create associations between users and the group
        for (const userId of groupDetails.userIds) {
            let admin = false;
            if (userId == req.user.id)
                admin = true;
            const userGroup = yield userGroup_1.default.create({
                userId,
                groupId: group.id,
                admin: admin
            });
            // console.log(userGroup);
        }
        res.status(201).json({ message: 'Group created successfully', groupId: group.id, groupName: groupDetails.groupName });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.addGroup = addGroup;
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupIds = yield userGroup_1.default.findAll({ where: { userId: req.user.id },
            attributes: ['groupId'],
        });
        //map and filter functions do not wait for async ops to get completed
        //rather they return promises and these promises need to be resolved
        const groupNamesPromises = groupIds.map((groupData) => __awaiter(void 0, void 0, void 0, function* () {
            const group = yield group_1.default.findByPk(groupData.groupId);
            return group.groupname;
        }));
        const groupNames = yield Promise.all(groupNamesPromises);
        res.status(201).json({ groupIds: groupIds, groupNames: groupNames });
    }
    catch (err) {
        console.log(err);
    }
});
exports.getGroups = getGroups;
const getMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = req.query.groupId;
    try {
        const userIds = yield userGroup_1.default.findAll({ where: { groupId: groupId },
            attributes: ['userId', 'admin'],
        });
        const userNamePromises = userIds.map((userData) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(userData.userId);
            return user.username;
        }));
        const userNames = yield Promise.all(userNamePromises);
        // console.log(userNames);
        res.status(201).json({ userIds: userIds, userNames: userNames });
    }
    catch (err) {
        console.log(err);
    }
});
exports.getMembers = getMembers;
const removeUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = req.query.groupId;
    const userId = req.query.userId;
    // console.log(userId,groupId);
    try {
        const userGroup = yield userGroup_1.default.findAll({ where: { userId: userId, groupId: groupId } });
        console.log(userGroup);
        yield userGroup[0].destroy();
        res.status(201).json({ message: "user removed" });
    }
    catch (error) {
        console.log(error);
    }
});
exports.removeUser = removeUser;
const makeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = req.query.groupId;
    const userId = req.query.userId;
    try {
        const result = yield userGroup_1.default.update({ admin: true }, { where: { userId: userId, groupId: groupId } });
        res.status(201).json(result);
    }
    catch (error) {
        console.log(error);
    }
});
exports.makeAdmin = makeAdmin;
