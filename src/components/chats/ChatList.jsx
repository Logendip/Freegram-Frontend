import ChatItem from "./ChatItem";

function ChatList({
chats,
selectedChat,
getChatName,
onSelectChat
}) {
if (chats.length === 0) {
return (
<p
style={{
color: "#777",
padding: "10px"
}}
>
Чатів поки немає. </p>
);
}


return (
    <div>
        {chats.map((chat) => (
            <ChatItem
                key={chat.id}
                chat={chat}
                name={getChatName(chat)}
                selected={
                    selectedChat?.id ===
                    chat.id
                }
                onClick={() =>
                    onSelectChat(chat)
                }
            />
        ))}
    </div>
);


}

export default ChatList;
