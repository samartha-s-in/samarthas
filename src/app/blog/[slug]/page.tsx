import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import styles from './Post.module.css';
import { notFound } from 'next/navigation';

const postsDirectory = path.join(process.cwd(), '_posts');

export async function generateStaticParams() {
    const filenames = fs.readdirSync(postsDirectory);
    return filenames.map(filename => ({
        slug: filename.replace(/\.mdx$/, ''),
    }));
}

async function getPostData(slug: string) {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
        notFound();
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
        frontmatter: data,
        content,
    };
}

// THE FIX IS HERE: We define a clear type for the component's props.
type Props = {
    params: {
        slug: string;
    };
};

export default async function PostPage({ params }: Props) { // And we use that Props type here.
    const { frontmatter, content } = await getPostData(params.slug);

    return (
        <div className="container">
            <article className={styles.post}>
                <header className={styles.postHeader}>
                    <h1 className={styles.postTitle}>{frontmatter.title}</h1>
                    <p className={styles.postMeta}>
                        Published on {new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </header>
                <div className={styles.postBody}>
                    <MDXRemote source={content} />
                </div>
            </article>
        </div>
    );
}