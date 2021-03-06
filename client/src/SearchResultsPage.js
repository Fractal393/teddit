import {useEffect, useState} from "react";
import axios from "axios";
import Post from "./Post";

function SearchResultsPage(props) {
  const {text} = props.match.params;
  const [comments,setComments] = useState([]);

  useEffect(() => {
    axios.get('/comments?search='+text, {withCredentials:true})
      .then(response => setComments(response.data));
  }, []);


  return (
    <div className="bg-verite_light dark:bg-verite_dark round h-screen">
      {comments.map(comment => (
        <Post {...comment} isListing={true} />
      ))}
    </div>
  );
}

export default SearchResultsPage;