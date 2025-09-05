import ContentBlockForm from "@/components/ContentBlockForm";

const ContentEditor = () => {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <ContentBlockForm block={{ type: "CONTENT" }} />
    </div>
  );
};

export default ContentEditor;

