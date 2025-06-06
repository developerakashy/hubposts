import { useEffect, useRef, useState } from "react"

const VersionCard = ({
    version,
    currentVersion,
    setCurrentVersion,
}) => {
    const [text, setText] = useState(version?.text || '')
    const [editable, setEditable] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const textareaRef = useRef()

    useEffect(() => {
        if(editable){
            setTimeout(() => textareaRef.current?.focus(), 0)
        }
    }, [editable])

    return(
        <div>
            <div className={`${currentVersion?.id === version?.id ? "border-blue-500" : "border-stone-200"} bg-white px-3 py-3 rounded-lg w-fit`}>
                <div className="flex gap-8 justify-between">
                    <div className="flex gap-2 items-center">
                        <button onClick={() => setExpanded(prev => !prev)} className="text-xs border border-stone-200 hover:bg-stone-100 cursor-pointer rounded p-1">Expand</button>
                        <p>{version?.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className={`${editable ? "bg-stone-200 border-blue-500 border-2" : ""} cursor-pointer text-xs hover:bg-stone-100 rounded px-2`} onClick={() => setEditable(prev => !prev)}>edit</button>
                        <button onClick={() => setCurrentVersion(version)} className="text-xs border border-stone-300 hover:bg-stone-100 cursor-pointer rounded px-2">{currentVersion?.id === version?.id ? "viewing" : 'view'}</button>
                        <button className="ml-1 cursor-pointer">⋮</button>
                    </div>
                </div>

                <div className="w-[500px]">
                    <textarea
                        ref={textareaRef}
                        className={`${editable || expanded ? "" : "hidden"} mt-4
                        w-[500px] resize-none  border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 p-2 rounded
                        `}
                        rows="6"
                        placeholder="Type here..."
                        value={text}
                        disabled={!editable}
                        onChange={(e) => setText(e.target.value)}
                        ></textarea>
                </div>
            </div>
            <p className="text-xs text-end mt-2 text-stone-500 font-light">12 may 2025, 12:34pm</p>
        </div>
    )
}

export default VersionCard
