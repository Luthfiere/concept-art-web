import Navbar from "../components/layout/Navbar";
import PostJobForm from "../components/job/PostJobForm";

const PostJobPage = () => {
  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <div className="max-w-4xl mx-auto mt-10">

        <h1 className="text-2xl font-bold mb-6">
          
        </h1>

        <PostJobForm />

      </div>

    </div>
  );
};

export default PostJobPage;