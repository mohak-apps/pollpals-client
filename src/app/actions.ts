"use server";

import { redis } from "@/lib/redis";
import { redirect } from "next/navigation";

export const createTopic = async ({ topicName }: { topicName: string }) => {
  const regex = /^[a-zA-Z-]+$/;

  if (!topicName || topicName.length > 50) {
    return { error: "Name must be between 1 and 50 chars" };
  }

  if (!regex.test(topicName)) {
    return { error: "Only letters and hyphens are allowed in topic" };
  }

  await redis.sadd("existing-topics", topicName); // SADD adds specified members to a set stored at a given key

  redirect(`/${topicName}`); // redirect to localhost:3000/topic-name
};

function wordFreq(text: string): { text: string; value: number }[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
}

export const submitComment = async ({
  comment,
  topic,
}: {
  comment: string;
  topic: string;
}) => {
  const words = wordFreq(comment); // words will be [{ text: redis, value: 1}, { text: is, value: 2}]

  await Promise.all(
    words.map(async (word) => {
      await redis.zadd(
        `room:${topic}`,
        { incr: true },
        { member: word.text, score: word.value }
      );
    })
  );

  await redis.incr("served-request");

  console.log('pub')
  console.log(words)
  await redis.publish(`room:${topic}`, words);
};
