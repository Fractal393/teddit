import Post from "./Post";
import {useState,useEffect} from "react";
import axios from "axios";

function PostsListing() {

  const [comments,setComments] = useState([]);

  useEffect(() => {
    axios.get("https://shrouded-earth-76176.herokuapp.com/comments", {withCredentials:true})
      .then(response => setComments(response.data));

  }, []);


  return (
    <div className="bg-verite_light dark:bg-verite_dark">
      {comments.map(comment => (
        <Post {...comment} isListing={true} />
      ))}
    </div>
  );
}

export default PostsListing;