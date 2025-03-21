import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Bookmark,
  Ghost,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import CommentDialog from "./CommentDialog";

const Post = () => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="" alt="post_image"></AvatarImage>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1>username</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer"></MoreHorizontal>
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            <Button variant={Ghost} className="cursor-pointer w-fit font-bold">
              Unfollow
            </Button>
            <Button variant={Ghost} className="cursor-pointer w-fit font-bold">
              Add to favorites
            </Button>
            <Button variant={Ghost} className="cursor-pointer w-fit font-bold">
              Delete
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square ob"
        src="https://images.pexels.com/photos/4345410/pexels-photo-4345410.jpeg?auto=compress&cs=tinysrgb&w=600"
        alt="post_image"
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          <FaRegHeart
            size={"22px"}
            className="cursor-pointer hover:text-gray-600"
          />
          <MessageCircle
            onClick={() => setOpen(true)}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        <Bookmark className="cursor-pointer hover:text-gray-600" />
      </div>
      <span className="font-medium block mb-2">1k likes</span>
      <p>
        <span className="font-medium mr-2">username</span>
        caption
      </p>
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer text-gray-500 text-sm"
      >
        View all 10 comments
      </span>
      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && <span className="text-blue-500">post</span>}
      </div>
    </div>
  );
};

export default Post;
