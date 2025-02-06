import React, {useState} from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { ScrollArea } from '../ui/scroll-area'
import axios from 'axios'
import { toast } from 'react-toastify'

const Comment = ({isOpen, setIsOpen, initialComment, reportId, onCommentAdded, token, url}) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(initialComment)
  const [isCommenting, setIsCommenting] = useState(false);

  const handleSubmit = async (e, newComment) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsCommenting(true);
    try {
      const response = await axios.post(
        `${url}/api/report/comment/${reportId}`,
        {text: comment},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setComment('');
        setComments([...comments, newComment]);
        onCommentAdded(response.data.comment)
        window.location.reload()
        toast.success('Comment added successfully', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.error('Faild to post comment:', e);
      toast.error('Failed to post comment', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {comments?.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No comments yet. Be the First one to comment💭!
            </p>
          ) : (
            <div className='flex flex-col gap-4'>
              {comments.map((comment) => (
                comment && (
                <div key={comment.id} className='flex gap-3'>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.profile_image || "/avatar-placeholder.png"}
                      alt={comment.username}
                    />
                    <AvatarFallback>
                      {comment.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm'>
                        {comment.name}
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        @{comment.username}
                      </span>
                    </div>
                    <p className='text-sm'>
                      {comment.text}
                    </p>
                  </div>
                </div>
                )
              ))}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className='flex flex-col gap-2 mt-4'>
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            disabled={isCommenting}
          />
          <Button 
            type="submit"
            disabled={!comment.trim() || isCommenting}
            className="self-end"
          >
            {isCommenting ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-current'/>
            ) : (
              'Post'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default Comment