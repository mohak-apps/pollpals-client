import { redis } from "@/lib/redis";
import ClientPage from "./ClientPage";

interface PageProps {
  params: {
    topic: string; // should be same as [topic] being dynamic
  };
}

const Page = async ({ params }: PageProps) => {

  const { topic } = params; // Next.js will provide { topic: 'Aru' } as the params
  // [topic] => ex. Aru [member, score, member, score........]
  // zrange will return [cute, 3, is, 5, great, 9, rich, 2]
  const initialData = await redis.zrange(`room:${topic}`, 0, 49, {
    withScores: true,
  });

  const words: { text: string; value: number }[] = [];

  initialData.map((_, i) => {
    const [text, value] = initialData.slice(i, i + 2);
    if (typeof text === "string" && typeof value === "number") {
      words.push({ text: text, value: value });
    }
  });

  await redis.incr("served-request");

  return <ClientPage topicName={topic} initialData={words} />;
};

export default Page;
