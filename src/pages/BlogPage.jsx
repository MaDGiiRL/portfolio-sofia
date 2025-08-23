import { useState } from "react";
import { posts as allPosts } from "../data/posts";
import BlogList from "../components/BlogList";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
export default function BlogPage() {
    const [search, setSearch] = useState("");
    const { t } = useTranslation();
    const filteredPosts = allPosts.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="pt-5" id="all-projects">
            <div className="container py-5">
                <div className="row header">
                    <div className="col-12 col-md-5 col-lg-5">
                        <h2 className="text-white text-left display-5 text-uppercase">
                            <i className="bi bi-bookmark-heart"></i>  Il Mio Blog
                        </h2></div>
                    <div className="col-12 mb-3 col-md-5 col-lg-5 text-md-end text-lg-end">
                        <Link to="/" className="btn-login">
                            ← {t('form27')}
                        </Link>
                    </div>
                </div>
                <div className="row justify-content-center">

                    <div className="mb-4 contactForm">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Cerca un articolo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredPosts.length > 0 ? (
                        <BlogList posts={filteredPosts} />
                    ) : (
                        <p className="text-muted">Nessun articolo trovato.</p>
                    )}
                </div>
            </div>
        </section>



    );
}