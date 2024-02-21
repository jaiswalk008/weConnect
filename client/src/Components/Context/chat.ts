
import { createSlice } from "@reduxjs/toolkit";
import { user } from "../Chat/UserList";
export type Group = {
    groupName: string;
    currentGroupMembers: user[];
    groupId:number;
  };
  
  interface ChatState {
    groups: Group[];
    currentGroupList: user[];
    currentGroup:{groupName:string , groupId:number};
  }
const initialState:ChatState  = {
    currentGroup: { groupName: '', groupId: 0 }, 
    groups:[],
    currentGroupList:[],
}
const chatSlice = createSlice({
    name:'chat',
    initialState,
    reducers:{
        //dd  user to ther group
        addTogroup(state: ChatState, action){
            console.log(action.payload);
            state.groups.unshift(action.payload);
             
        },
        //set list of groups
        setGroup(state,action){
            state.groups = action.payload;
            state.currentGroup = action.payload[0];
            
        },
      
        setCurrentGroupList(state, action){
            state.currentGroupList = action.payload;
            // console.log(state.currentGroupList);
        },
        setCurrentGroup(state,action){
            state.currentGroup = action.payload;
            console.log(action.payload)
        }
    }
})
export default chatSlice;