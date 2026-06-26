# import os
# from openai import OpenAI
# from groq import Groq


# class AIClient:
#     def __init__(self):
#         self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
#         # self.client = OpenAI(
#         #     api_key=os.getenv("OPENAI_API_KEY")
#         # )
#         # self.model = os.getenv(
#         #     "OPENAI_MODEL",
#         #     "gpt-4o"
#         # )

#     def chat_completion(
#     self,
#     system,
#     content,
#     max_tokens=3000,
#     temperature=0.2,
#     ):
#         messages = [{"role": "system", "content": system}]

#         messages.append({
#             "role": "user",
#             "content": content
#         })

#         return self.client.chat.completions.create(
#             model=self.model,
#             messages=messages,
#             max_tokens=max_tokens,
#             temperature=temperature,
#         )
# client = AIClient()

import os
from groq import Groq


class AIClient:
    def __init__(self):
        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = os.getenv(
            "GROQ_MODEL",
            "llama-3.3-70b-versatile"
        )

    def chat_completion(
        self,
        system,
        content,
        max_tokens=3000,
        temperature=0.2,
        json_mode=False,
    ):
        # Convert OpenAI vision content -> text for Groq
        if isinstance(content, list):
            text_parts = []

            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    text_parts.append(item.get("text", ""))

            content = "\n".join(text_parts)

        kwargs = {}

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        return self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": content},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        )


client = AIClient()