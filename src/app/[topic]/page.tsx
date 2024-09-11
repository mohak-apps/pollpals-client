import { redis } from "@/lib/redis";

interface PageProps {
  params: {
    topic: string; // should be same as [topic] being dynamic
  };
}
// localhost:3000/topic-name
const Page = async ({ params }: PageProps) => {
  const { topic } = params;

  const initialData = await redis.zrange(`room:${topic}`, 0, 49, {
    withScores: true,
  });

  const words: { text: string; value: number }[] = [];

  words.map((word, i) => {
    const [text, value] = initialData.slice(i, i + 2);
    if (typeof text === "string" && typeof value === "number") {
      words.push({ text, value });
    }
  });

  await redis.incr("served-request");

  return <p>{params.topic}</p>;
};

export default Page;
