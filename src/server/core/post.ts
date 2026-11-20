import { reddit } from '@devvit/web/server';
import { chainNumber, dayKeyUTC } from '../../shared/dominoes';

export const createPost = async (): Promise<{ id: string }> => {
  const number = chainNumber(dayKeyUTC());
  const post = await reddit.submitCustomPost({
    title: `Daily chain #${number} — topple all eight`,
  });
  return { id: post.id };
};
