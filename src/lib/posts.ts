import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function getPostsDirectory(): string {
  const directPath = path.join(process.cwd(), '_posts');
  if (fs.existsSync(directPath)) return directPath;
  const subPath = path.join(process.cwd(), 'SamarthaS', '_posts');
  if (fs.existsSync(subPath)) return subPath;
  return directPath;
}

export function getSortedPostsData() {
  const postsDirectory = getPostsDirectory();
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory).filter((fileName) =>
    fileName.endsWith('.mdx') || fileName.endsWith('.md')
  );

  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.(mdx|md)$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      ...(matterResult.data as {
        title: string;
        date: string;
        excerpt: string;
        category?: string;
        tags?: string[];
      }),
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}
