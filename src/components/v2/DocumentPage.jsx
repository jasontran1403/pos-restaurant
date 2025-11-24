import React, { useState, useRef, useEffect } from "react";

const videos = [
    { id: 1, title: "Quy trình chế biến Hamburger/Chicken Burger", youtubeId: "WSz7nGr9dr0" },
    { id: 2, title: "Quy trình chế biến Hotdogs/Mozzaella Hotdogs", youtubeId: "gScSJqPVTvo" },
];

const DocumentPage = () => {
    const [openId, setOpenId] = useState(null);
    const cardRefs = useRef({});

    const toggle = (id) => {
        setOpenId(openId === id ? null : id);
    };

    // scroll video into view with offset
    useEffect(() => {
        if (openId !== null && cardRefs.current[openId]) {
            const topOffset = 20; // khoảng cách từ top viewport
            const elementTop = cardRefs.current[openId].getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementTop - topOffset,
                behavior: "smooth",
            });
        }
    }, [openId]);

    const iframeHeight = window.innerWidth >= 768 ? 700 : 500;

    // Nếu openId có giá trị, chỉ hiển thị item đó, nếu null thì hiển thị full
    const visibleVideos = openId !== null
        ? videos.filter((item) => item.id === openId)
        : videos;

    return (
        <div style={styles.container}>
            {visibleVideos.map((item) => (
                <div
                    key={item.id}
                    ref={(el) => (cardRefs.current[item.id] = el)}
                    style={styles.card}
                    onClick={() => toggle(item.id)}
                >
                    <strong>{item.title}</strong>

                    {openId === item.id && (
                        <div style={styles.videoWrapper}>
                            <iframe
                                src={`https://www.youtube.com/embed/${item.youtubeId}?modestbranding=1&rel=0&showinfo=0`}
                                title={item.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{
                                    ...styles.iframe,
                                    height: iframeHeight,
                                }}
                            ></iframe>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        margin: "0 auto",
        maxWidth: "900px",
        width: "100%",
    },
    card: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "12px",
        cursor: "pointer",
        color: "white",
    },
    videoWrapper: {
        marginTop: "15px",
    },
    iframe: {
        width: "100%",
        borderRadius: "8px",
    },
};

export default DocumentPage;
