"use server";
import { cookies } from "next/headers";
import axios from "axios";

export default async function fetchReposAction() {
  try {
    const token = cookies().get("token")?.value;
    const res = await axios.post(`http://localhost:8000/repo/get-repos/`, {
      uid: token,
    });
    if (res.status === 200 && !res.data.error) {
      return { success: true, repos: res.data };
    }
    return { success: false, error: res.data.detail };
  } catch (error) {
    console.error(
      "Error fetching repositories:",
      error.response?.data?.detail || error.message,
    );
    return { success: false, error: "Something went wrong" };
  }
}
