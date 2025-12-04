import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html className="light">
            <Head>
                <meta name="basePath" content={process.env.NEXT_PUBLIC_BASE_PATH || ''} />
            </Head>
            <body className="dark:bg-gray-800">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}