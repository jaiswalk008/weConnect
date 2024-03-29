import { useEffect , useRef } from "react";
const ChatContainer = (props:any) =>{
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const username = localStorage.getItem('username');
    
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [props.messages]);

    return(
        <div className="h-75 chat d-flex justify-content-start flex-column " ref={chatContainerRef}>
       
            {props.messages.map((element:any)=>{
               const user = username===element.user.username ? 'you' : element.user.username;
                return (
                    <div key={element.id}><p className={username===element.user.username ?'self':'other' }
                    >{user }: {element.type==='text'?element.content : 
                    <img height="200px" width="200px" src={`${element.content}`}/>}</p></div>
                )
            })}
        </div>
    )
}
export default ChatContainer;